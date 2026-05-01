class Api::V1::Admin::TeachersController < Api::V1::Admin::BaseController
  before_action :set_teacher, only: [:show, :update, :destroy]

  def index
    @teachers = Teacher.includes(:classroom).order(:name)
    @teachers = @teachers.where(classroom_id: params[:classroom_id]) if params[:classroom_id]
    @teachers = @teachers.where(subject_category: params[:subject_category]) if params[:subject_category]
    render json: @teachers.as_json(include: :classroom)
  end

  def show
    render json: @teacher.as_json(include: :classroom)
  end

  def create
    @teacher = Teacher.new(teacher_params)
    if @teacher.save
      render json: @teacher.as_json(include: :classroom), status: :created
    else
      render_error("Validation failed", details: @teacher.errors.as_json)
    end
  end

  def update
    if @teacher.update(teacher_params)
      render json: @teacher.as_json(include: :classroom)
    else
      render_error("Validation failed", details: @teacher.errors.as_json)
    end
  end

  def destroy
    @teacher.destroy
    head :no_content
  end

  private

  def set_teacher
    @teacher = Teacher.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Teacher")
  end

  def teacher_params
    params.require(:teacher).permit(
      :employee_number, :name, :gender, :classroom_id, :job_type,
      :subject_category, :years_of_service,
      :academic_score, :management_score, :attrition_risk_score,
      :available_weekdays,
      teachable_subjects: [],
      teachable_course_types: []
    )
  end
end
