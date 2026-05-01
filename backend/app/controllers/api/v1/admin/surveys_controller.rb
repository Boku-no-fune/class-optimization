class Api::V1::Admin::SurveysController < Api::V1::Admin::BaseController
  before_action :set_survey, only: [:show, :update, :destroy, :deliver, :results]

  def index
    @surveys = Survey.includes(:created_by).order(created_at: :desc)
    render json: @surveys.as_json(include: :created_by)
  end

  def show
    render json: @survey.as_json(include: { survey_deliveries: { include: [:teacher, :survey_response] } })
  end

  def create
    @survey = Survey.new(survey_params.merge(created_by: current_user))
    if @survey.save
      render json: @survey, status: :created
    else
      render_error("Validation failed", details: @survey.errors.as_json)
    end
  end

  def update
    if @survey.update(survey_params)
      render json: @survey
    else
      render_error("Validation failed", details: @survey.errors.as_json)
    end
  end

  def destroy
    @survey.destroy
    head :no_content
  end

  def deliver
    teacher_ids = params[:teacher_ids]
    return render_error("teacher_ids required") if teacher_ids.blank?

    created = 0
    Teacher.where(id: teacher_ids).each do |teacher|
      next if SurveyDelivery.exists?(survey: @survey, teacher: teacher)
      SurveyDelivery.create!(survey: @survey, teacher: teacher)
      SurveyMailer.delivery_notification(teacher, @survey).deliver_later
      created += 1
    end

    render json: { delivered_to: created }
  end

  def results
    deliveries = @survey.survey_deliveries.includes(:teacher, :survey_response)
    render json: {
      survey: @survey,
      total_sent: deliveries.count,
      responded: deliveries.joins(:survey_response).count,
      deliveries: deliveries.as_json(include: [:teacher, :survey_response])
    }
  end

  private

  def set_survey
    @survey = Survey.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Survey")
  end

  def survey_params
    params.require(:survey).permit(
      :survey_type, :title, :description, :deadline,
      target_weekdays: [],
      target_slots: {}
    )
  end
end
