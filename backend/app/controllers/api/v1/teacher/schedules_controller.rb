class Api::V1::Teacher::SchedulesController < ApplicationController
  before_action :require_teacher!

  def index
    teacher = current_user.teacher
    entries = ScheduleEntry.joins(schedule: :classroom)
                           .where(teacher_id: teacher.id)
                           .where(schedules: { status: :published })
                           .where(date: date_range)
                           .includes(:schedule)
                           .order(:date)

    render json: entries
  end

  private

  def require_teacher!
    render json: { error: "Forbidden" }, status: :forbidden unless current_user&.teacher?
  end

  def date_range
    year = params[:year]&.to_i || Date.current.year
    month = params[:month]&.to_i || Date.current.month
    Date.new(year, month).beginning_of_month..Date.new(year, month).end_of_month
  end
end
