class Classroom < ApplicationRecord
  belongs_to :block
  has_many :teachers, dependent: :nullify
  has_many :regular_classes, dependent: :destroy
  has_many :intensive_classes, dependent: :destroy
  has_many :schedules, dependent: :destroy

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true
end
