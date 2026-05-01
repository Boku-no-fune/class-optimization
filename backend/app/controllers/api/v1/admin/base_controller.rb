class Api::V1::Admin::BaseController < ApplicationController
  before_action :require_admin!

  private

  def require_admin!
    render json: { error: "Forbidden" }, status: :forbidden unless current_user&.admin?
  end
end
