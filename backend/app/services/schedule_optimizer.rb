class ScheduleOptimizer
  WEEKDAY_NAMES = %w[sunday monday tuesday wednesday thursday friday saturday].freeze

  def initialize(classroom_id:, year:, class_ids: nil)
    @classroom = Classroom.find(classroom_id)
    @year = year
    @class_ids = class_ids
  end

  def optimize
    classes = fetch_classes
    proposals = []
    warnings = []

    classes.each do |klass|
      result = optimize_class(klass)
      proposals << result[:proposal]
      warnings.concat(result[:warnings])
    end

    template = build_two_week_template(proposals)
    crossing_warnings = check_crossing_teachers(proposals)
    warnings.concat(crossing_warnings)

    { proposals: proposals, warnings: warnings, two_week_template: template }
  end

  private

  def fetch_classes
    if @class_ids.present?
      RegularClass.includes(:course, :classroom)
                  .where(id: @class_ids, classroom_id: @classroom.id)
    else
      RegularClass.includes(:course, :classroom)
                  .where(classroom_id: @classroom.id, year: @year)
    end
  end

  def optimize_class(klass)
    proposal = { class_id: klass.id, class_name: klass.name, assignments: {}, unresolved: [] }
    warnings = []
    subject_pattern = klass.subject_pattern || {}

    ["week1", "week2"].each do |week|
      week_pattern = subject_pattern[week] || {}
      week_pattern.each do |weekday_num_str, slots|
        next if slots.blank?
        weekday_num = weekday_num_str.to_i
        weekday_name = WEEKDAY_NAMES[weekday_num]

        slots.each do |slot|
          subject = slot["subject"]
          next unless subject

          key = "#{week}_#{weekday_name}_#{subject}"

          # Skip if already manually assigned
          if klass.teacher_assignments.dig("overrides", key)
            proposal[:assignments][key] = klass.teacher_assignments.dig("overrides", key)
            next
          end

          # Check default assignment for subject category
          category = subject_category_for(subject)
          if klass.teacher_assignments[category.to_s]
            proposal[:assignments][key] = klass.teacher_assignments[category.to_s]
            next
          end

          # Find best matching teacher
          result = find_best_teacher(klass, subject, weekday_num)
          if result[:teacher]
            proposal[:assignments][key] = result[:teacher].id
          else
            proposal[:unresolved] << { key: key, subject: subject, weekday: weekday_name, reasons: result[:reasons] }
            warnings << { class_name: klass.name, key: key, reasons: result[:reasons] }
          end
        end
      end
    end

    { proposal: proposal, warnings: warnings }
  end

  def find_best_teacher(klass, subject, weekday_num)
    weekday_name = WEEKDAY_NAMES[weekday_num]
    reasons = []

    # Step 1: teachable_subjects
    candidates = Teacher.where(classroom_id: @classroom.id)
                        .where("? = ANY(teachable_subjects)", subject)
    if candidates.empty?
      other_classroom = Teacher.where.not(classroom_id: @classroom.id)
                               .where("? = ANY(teachable_subjects)", subject)
      if other_classroom.empty?
        reasons << "指導可能な講師が存在しません（科目: #{subject}）"
        return { teacher: nil, reasons: reasons }
      end
      candidates = other_classroom
      reasons << "同教室に#{subject}担当講師がいないため他教室候補を使用"
    end

    # Step 2: available weekday
    available = candidates.select { |t| t.available_on?(weekday_name) }
    if available.empty?
      reasons << "#{weekday_name}に勤務可能な講師がいません"
      return { teacher: nil, reasons: reasons }
    end

    # Step 3: survey response availability
    available_by_survey = filter_by_survey(available, weekday_num)

    # Step 4: sort by score distance
    pool = available_by_survey.presence || available
    pool = pool.sort_by { |t| score_distance(t, klass) }

    { teacher: pool.first, reasons: [] }
  end

  def filter_by_survey(teachers, weekday_num)
    teachers.select do |t|
      latest_response = t.survey_deliveries
                         .joins(:survey, :survey_response)
                         .where(surveys: { survey_type: :weekly_availability })
                         .order("survey_deliveries.created_at DESC")
                         .first
                         &.survey_response

      next true unless latest_response

      weekday_name = WEEKDAY_NAMES[weekday_num]
      answers = latest_response.answers || {}
      slot = answers[weekday_name]
      slot.nil? || slot["available"] == true
    end
  end

  def score_distance(teacher, klass)
    academic_diff = klass.recommended_academic_score ? (teacher.academic_score - klass.recommended_academic_score).abs : 0
    management_diff = klass.recommended_management_score ? (teacher.management_score - klass.recommended_management_score).abs : 0
    academic_diff + management_diff
  end

  def subject_category_for(subject)
    if Course::SUBJECTS[:liberal_arts].include?(subject)
      :liberal_arts
    else
      :science
    end
  end

  def build_two_week_template(proposals)
    template = { "week1" => {}, "week2" => {} }
    proposals.each do |proposal|
      proposal[:assignments].each do |key, teacher_id|
        parts = key.split("_", 3)
        week, weekday, subject = parts
        next unless week && weekday && subject
        template[week][weekday] ||= []
        template[week][weekday] << { class_id: proposal[:class_id], subject: subject, teacher_id: teacher_id }
      end
    end
    template
  end

  def check_crossing_teachers(proposals)
    warnings = []
    teacher_day_map = Hash.new { |h, k| h[k] = [] }

    proposals.each do |proposal|
      proposal[:assignments].each do |key, teacher_id|
        parts = key.split("_", 3)
        week, weekday = parts
        next unless week && weekday
        teacher_day_map["#{teacher_id}_#{week}_#{weekday}"] << { class_id: proposal[:class_id], classroom: @classroom }
      end
    end

    teacher_day_map.each do |key, entries|
      next unless entries.size > 1
      classrooms = entries.map { |e| e[:classroom] }.uniq
      if classrooms.size > 1
        travel_time = estimate_travel_time(classrooms[0], classrooms[1])
        if travel_time > 30
          warnings << {
            type: "crossing",
            teacher_id: key.split("_").first,
            details: "同日に複数教室の担当あり。推定移動時間: #{travel_time}分（バッファ30分を超過）"
          }
        end
      end
    end

    warnings
  end

  def estimate_travel_time(classroom_a, classroom_b)
    # Simple estimation based on station name comparison
    return 0 if classroom_a.nearest_station == classroom_b.nearest_station
    30  # Default 30 minutes if different stations
  end
end
