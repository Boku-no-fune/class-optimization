class ScheduleEntry < ApplicationRecord
  belongs_to :schedule
  belongs_to :teacher, optional: true

  validates :date, presence: true
  validates :class_id, presence: true
  validates :class_type, presence: true, inclusion: { in: %w[RegularClass IntensiveClass] }
end
