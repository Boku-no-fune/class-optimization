class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  enum :role, { admin: 0, teacher: 1 }

  belongs_to :teacher, optional: true

  validates :role, presence: true
  validate :teacher_required_for_teacher_role

  private

  def teacher_required_for_teacher_role
    if role == "teacher" && teacher_id.nil?
      errors.add(:teacher, "must be set for teacher role")
    end
  end
end
