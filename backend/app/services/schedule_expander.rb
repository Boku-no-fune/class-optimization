class ScheduleExpander
  WEEKDAY_NAMES = %w[sunday monday tuesday wednesday thursday friday saturday].freeze

  def initialize(schedule)
    @schedule = schedule
    @classroom = schedule.classroom
  end

  def expand
    @schedule.schedule_entries.destroy_all
    entries = []

    start_date = @schedule.valid_from
    end_date   = @schedule.valid_to
    template   = @schedule.two_week_template || {}

    regular_classes = RegularClass.where(classroom_id: @classroom.id, year: @schedule.year)

    current_date = start_date
    cycle_start  = start_date

    while current_date <= end_date
      days_since_cycle = (current_date - cycle_start).to_i
      week_key = days_since_cycle < 7 ? "week1" : "week2"

      # Reset cycle every 14 days
      if days_since_cycle >= 14
        cycle_start = current_date
        week_key = "week1"
      end

      weekday_name = WEEKDAY_NAMES[current_date.wday]
      day_slots = template.dig(week_key, weekday_name) || []

      day_slots.each do |slot|
        klass = regular_classes.find { |c| c.id == slot["class_id"] }
        next unless klass

        course = klass.course
        start_time = Time.parse("09:00")  # Default, can be improved
        minutes = course.minutes_per_period || 90

        entry = ScheduleEntry.create!(
          schedule: @schedule,
          class_id: klass.id,
          class_type: "RegularClass",
          date: current_date,
          start_time: start_time,
          end_time: start_time + minutes.minutes,
          subject: slot["subject"],
          teacher_id: slot["teacher_id"]
        )
        entries << entry
      end

      current_date += 1.day
    end

    entries
  end
end
