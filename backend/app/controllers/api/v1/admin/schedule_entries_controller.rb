class Api::V1::Admin::ScheduleEntriesController < Api::V1::Admin::BaseController
  before_action :set_entry

  def show
    render json: @entry
  end

  def update
    if @entry.update(entry_params.merge(is_modified: true))
      render json: @entry
    else
      render_error("Validation failed", details: @entry.errors.as_json)
    end
  end

  private

  def set_entry
    @entry = ScheduleEntry.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("ScheduleEntry")
  end

  def entry_params
    params.require(:schedule_entry).permit(:teacher_id, :note, :start_time, :end_time, :subject)
  end
end
