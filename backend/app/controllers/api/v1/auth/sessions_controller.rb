class Api::V1::Auth::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    render json: {
      user: {
        id: resource.id,
        email: resource.email,
        role: resource.role,
        teacher_id: resource.teacher_id
      }
    }, status: :ok
  end

  def respond_to_on_destroy
    if current_user
      render json: { message: "Signed out successfully." }, status: :ok
    else
      render json: { error: "No active session." }, status: :unauthorized
    end
  end
end
