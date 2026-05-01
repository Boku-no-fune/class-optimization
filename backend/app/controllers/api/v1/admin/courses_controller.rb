class Api::V1::Admin::CoursesController < Api::V1::Admin::BaseController
  before_action :set_course, only: [:show, :update, :destroy]

  def index
    @courses = Course.all.order(:name)
    render json: @courses
  end

  def show
    render json: @course
  end

  def create
    @course = Course.new(course_params)
    if @course.save
      render json: @course, status: :created
    else
      render_error("Validation failed", details: @course.errors.as_json)
    end
  end

  def update
    if @course.update(course_params)
      render json: @course
    else
      render_error("Validation failed", details: @course.errors.as_json)
    end
  end

  def destroy
    @course.destroy
    head :no_content
  end

  private

  def set_course
    @course = Course.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Course")
  end

  def course_params
    params.require(:course).permit(
      :name, :course_type, :subject_type,
      :sessions_per_week, :periods_per_session, :minutes_per_period,
      :total_days, :periods_per_day,
      target_grades: [], subjects: []
    )
  end
end
