class Api::V1::Admin::ImportsController < Api::V1::Admin::BaseController
  IMPORT_MODELS = {
    teachers: Teacher,
    classrooms: Classroom,
    courses: Course,
    regular_classes: RegularClass,
    intensive_classes: IntensiveClass
  }.freeze

  def teachers
    import(Teacher, teacher_row_mapper)
  end

  def classrooms
    import(Classroom, classroom_row_mapper)
  end

  def courses
    import(Course, course_row_mapper)
  end

  def regular_classes
    import(RegularClass, regular_class_row_mapper)
  end

  def intensive_classes
    import(IntensiveClass, intensive_class_row_mapper)
  end

  private

  def import(model, mapper)
    file = params[:file]
    return render_error("No file uploaded") unless file

    results = { success: 0, errors: [] }
    csv = CSV.parse(file.read, headers: true, encoding: "UTF-8")

    csv.each_with_index do |row, idx|
      attrs = mapper.call(row)
      record = model.new(attrs)
      if record.save
        results[:success] += 1
      else
        results[:errors] << { row: idx + 2, errors: record.errors.full_messages }
      end
    end

    render json: results, status: :ok
  rescue CSV::MalformedCSVError => e
    render_error("Invalid CSV format: #{e.message}")
  end

  def teacher_row_mapper
    ->(row) {
      {
        employee_number: row["employee_number"],
        name: row["name"],
        gender: row["gender"],
        classroom_id: row["classroom_id"],
        job_type: row["job_type"],
        subject_category: row["subject_category"],
        teachable_subjects: row["teachable_subjects"]&.split("|"),
        teachable_course_types: row["teachable_course_types"]&.split("|"),
        years_of_service: row["years_of_service"],
        academic_score: row["academic_score"] || 50,
        management_score: row["management_score"] || 50,
        attrition_risk_score: row["attrition_risk_score"] || 5
      }
    }
  end

  def classroom_row_mapper
    ->(row) { { code: row["code"], name: row["name"], block_id: row["block_id"], address: row["address"], nearest_station: row["nearest_station"] } }
  end

  def course_row_mapper
    ->(row) {
      {
        name: row["name"],
        course_type: row["course_type"],
        subject_type: row["subject_type"],
        target_grades: row["target_grades"]&.split("|")&.map(&:to_i),
        subjects: row["subjects"]&.split("|"),
        sessions_per_week: row["sessions_per_week"],
        periods_per_session: row["periods_per_session"],
        minutes_per_period: row["minutes_per_period"],
        total_days: row["total_days"],
        periods_per_day: row["periods_per_day"]
      }
    }
  end

  def regular_class_row_mapper
    ->(row) {
      {
        year: row["year"],
        name: row["name"],
        grade: row["grade"],
        course_id: row["course_id"],
        classroom_id: row["classroom_id"],
        weekdays: row["weekdays"]&.split("|")&.map(&:to_i),
        recommended_academic_score: row["recommended_academic_score"],
        recommended_management_score: row["recommended_management_score"]
      }
    }
  end

  def intensive_class_row_mapper
    ->(row) {
      {
        year: row["year"],
        intensive_name: row["intensive_name"],
        name: row["name"],
        grade: row["grade"],
        course_id: row["course_id"],
        classroom_id: row["classroom_id"],
        subjects: row["subjects"]&.split("|"),
        recommended_academic_score: row["recommended_academic_score"],
        recommended_management_score: row["recommended_management_score"]
      }
    }
  end
end
