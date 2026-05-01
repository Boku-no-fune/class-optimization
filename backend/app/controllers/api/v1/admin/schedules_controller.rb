class Api::V1::Admin::SchedulesController < Api::V1::Admin::BaseController
  before_action :set_schedule, only: [:show, :update, :destroy, :expand]

  def index
    @schedules = Schedule.includes(:classroom).order(created_at: :desc)
    @schedules = @schedules.where(classroom_id: params[:classroom_id]) if params[:classroom_id]
    render json: @schedules.as_json(include: :classroom)
  end

  def show
    render json: @schedule.as_json(include: [:classroom, :schedule_entries])
  end

  def optimize
    result = ScheduleOptimizer.new(
      classroom_id: params[:classroom_id],
      year: params[:year],
      class_ids: params[:class_ids]
    ).optimize

    schedule = Schedule.find_or_initialize_by(
      classroom_id: params[:classroom_id],
      year: params[:year],
      schedule_type: :regular
    )
    schedule.update!(
      status: :draft,
      two_week_template: result[:two_week_template],
      valid_from: params[:valid_from],
      valid_to: params[:valid_to]
    )

    render json: {
      schedule: schedule.as_json,
      proposals: result[:proposals],
      warnings: result[:warnings]
    }
  rescue ActiveRecord::RecordNotFound => e
    render_error(e.message, status: :not_found)
  end

  def update
    if @schedule.update(schedule_params)
      render json: @schedule
    else
      render_error("Validation failed", details: @schedule.errors.as_json)
    end
  end

  def destroy
    @schedule.destroy
    head :no_content
  end

  def expand
    return render_error("Schedule must be approved before expanding") unless @schedule.approved?
    return render_error("valid_from and valid_to are required") if @schedule.valid_from.nil? || @schedule.valid_to.nil?

    entries = ScheduleExpander.new(@schedule).expand
    @schedule.update!(status: :approved)

    render json: { entries_created: entries.count }
  end

  private

  def set_schedule
    @schedule = Schedule.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Schedule")
  end

  def schedule_params
    params.require(:schedule).permit(
      :status, :valid_from, :valid_to,
      two_week_template: {}
    )
  end
end
