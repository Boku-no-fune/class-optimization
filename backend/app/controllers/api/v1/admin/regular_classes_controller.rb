class Api::V1::Admin::RegularClassesController < Api::V1::Admin::BaseController
  before_action :set_class, only: [:show, :update, :destroy]

  def index
    @classes = RegularClass.includes(:course, :classroom).order(:year, :name)
    @classes = @classes.where(classroom_id: params[:classroom_id]) if params[:classroom_id]
    @classes = @classes.where(year: params[:year]) if params[:year]
    render json: @classes.as_json(include: [:course, :classroom])
  end

  def show
    render json: @class.as_json(include: [:course, :classroom])
  end

  def create
    @class = RegularClass.new(class_params)
    if @class.save
      render json: @class.as_json(include: [:course, :classroom]), status: :created
    else
      render_error("Validation failed", details: @class.errors.as_json)
    end
  end

  def update
    if @class.update(class_params)
      render json: @class.as_json(include: [:course, :classroom])
    else
      render_error("Validation failed", details: @class.errors.as_json)
    end
  end

  def destroy
    @class.destroy
    head :no_content
  end

  private

  def set_class
    @class = RegularClass.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("RegularClass")
  end

  def class_params
    params.require(:regular_class).permit(
      :year, :name, :grade, :course_id, :classroom_id,
      :recommended_academic_score, :recommended_management_score,
      weekdays: [],
      subject_pattern: {},
      teacher_assignments: {}
    )
  end
end
