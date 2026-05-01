class AdminNotificationJob < ApplicationJob
  queue_as :default

  def perform(event_type, record_id)
    case event_type
    when "survey_response_updated"
      response = SurveyResponse.find_by(id: record_id)
      return unless response
      User.where(role: :admin).each do |admin|
        AdminMailer.survey_response_changed(admin, response).deliver_later
      end
    end
  end
end
