class Api::V1::Admin::ClassroomsController < Api::V1::Admin::BaseController
  before_action :set_classroom, only: [:show, :update, :destroy]

  def index
    @classrooms = Classroom.includes(:block).order(:name)
    render json: @classrooms.as_json(include: :block)
  end

  def show
    render json: @classroom.as_json(include: :block)
  end

  def create
    @classroom = Classroom.new(classroom_params)
    if @classroom.save
      render json: @classroom.as_json(include: :block), status: :created
    else
      render_error("Validation failed", details: @classroom.errors.as_json)
    end
  end

  def update
    if @classroom.update(classroom_params)
      render json: @classroom.as_json(include: :block)
    else
      render_error("Validation failed", details: @classroom.errors.as_json)
    end
  end

  def destroy
    @classroom.destroy
    head :no_content
  end

  private

  def set_classroom
    @classroom = Classroom.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Classroom")
  end

  def classroom_params
    params.require(:classroom).permit(:code, :name, :block_id, :address, :nearest_station)
  end
end
