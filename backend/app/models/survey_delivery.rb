class SurveyDelivery < ApplicationRecord
  belongs_to :survey
  belongs_to :teacher
  has_one :survey_response, dependent: :destroy

  validates :teacher_id, uniqueness: { scope: :survey_id }
end
