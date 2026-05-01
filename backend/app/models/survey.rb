class Survey < ApplicationRecord
  enum :survey_type, { weekly_availability: 0, spot_availability: 1 }

  belongs_to :created_by, class_name: "User"
  has_many :survey_deliveries, dependent: :destroy
  has_many :teachers, through: :survey_deliveries

  validates :title, presence: true
  validates :survey_type, presence: true
end
