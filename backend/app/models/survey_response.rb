class SurveyResponse < ApplicationRecord
  belongs_to :survey_delivery

  validates :survey_delivery_id, uniqueness: true

  after_update :notify_admin_on_change

  private

  def notify_admin_on_change
    AdminNotificationJob.perform_later("survey_response_updated", id) if saved_changes?
  end
end
