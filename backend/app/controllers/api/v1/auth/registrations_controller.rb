class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  before_action :authenticate_user!
  before_action :require_admin!
  respond_to :json

  def create
    build_resource(sign_up_params)
    resource.save
    if resource.persisted?
      render json: { user: user_json(resource) }, status: :created
    else
      render json: { error: "Registration failed", details: resource.errors.as_json }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :role, :teacher_id)
  end

  def require_admin!
    render json: { error: "Forbidden" }, status: :forbidden unless current_user&.admin?
  end

  def user_json(user)
    { id: user.id, email: user.email, role: user.role, teacher_id: user.teacher_id }
  end
end
