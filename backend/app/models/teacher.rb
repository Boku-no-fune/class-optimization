class Teacher < ApplicationRecord
  enum :gender, { male: 0, female: 1, other: 2 }
  enum :subject_category, { liberal_arts: 0, science: 1 }

  belongs_to :classroom
  has_one :user, dependent: :nullify
  has_many :schedule_entries, dependent: :nullify
  has_many :survey_deliveries, dependent: :destroy

  validates :employee_number, presence: true, uniqueness: true
  validates :name, presence: true
  validates :gender, presence: true
  validates :subject_category, presence: true
  validates :academic_score, numericality: { in: 0..100 }
  validates :management_score, numericality: { in: 0..100 }
  validates :attrition_risk_score, numericality: { in: 0..100 }

  def available_on?(weekday_sym, time_str = nil)
    slot = available_weekdays[weekday_sym.to_s]
    return false if slot.nil?
    return true if time_str.nil?
    from = Time.parse(slot["from"])
    to   = Time.parse(slot["to"])
    t    = Time.parse(time_str)
    t >= from && t <= to
  end
end
