class Api::V1::Admin::BlocksController < Api::V1::Admin::BaseController
  before_action :set_block, only: [:show, :update, :destroy]

  def index
    @blocks = Block.all.order(:name)
    render json: @blocks
  end

  def show
    render json: @block
  end

  def create
    @block = Block.new(block_params)
    if @block.save
      render json: @block, status: :created
    else
      render_error("Validation failed", details: @block.errors.as_json)
    end
  end

  def update
    if @block.update(block_params)
      render json: @block
    else
      render_error("Validation failed", details: @block.errors.as_json)
    end
  end

  def destroy
    @block.destroy
    head :no_content
  end

  private

  def set_block
    @block = Block.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Block")
  end

  def block_params
    params.require(:block).permit(:name)
  end
end
