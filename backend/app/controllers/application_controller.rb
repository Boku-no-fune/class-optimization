class ApplicationController < ActionController::API
  before_action :authenticate_user!

  def render_error(message, status: :unprocessable_entity, details: {})
    render json: { error: message, details: details }, status: status
  end

  def render_not_found(resource = "Resource")
    render_error("#{resource} not found", status: :not_found)
  end
end
