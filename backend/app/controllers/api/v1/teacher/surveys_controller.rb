class Api::V1::Teacher::SurveysController < ApplicationController
  before_action :require_teacher!
  before_action :set_delivery, only: [:show, :respond]

  def index
    teacher = current_user.teacher
    deliveries = teacher.survey_deliveries
                        .includes(:survey, :survey_response)
                        .order(created_at: :desc)
    render json: deliveries.as_json(include: [:survey, :survey_response])
  end

  def show
    render json: @delivery.as_json(include: [:survey, :survey_response])
  end

  def respond
    response_record = @delivery.survey_response || @delivery.build_survey_response
    if response_record.update(answers: params[:answers], submitted_at: Time.current)
      render json: response_record
    else
      render_error("Validation failed", details: response_record.errors.as_json)
    end
  end

  private

  def require_teacher!
    render json: { error: "Forbidden" }, status: :forbidden unless current_user&.teacher?
  end

  def set_delivery
    @delivery = current_user.teacher.survey_deliveries.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("SurveyDelivery")
  end
end
