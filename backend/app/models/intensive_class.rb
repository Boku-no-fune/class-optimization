class IntensiveClass < ApplicationRecord
  belongs_to :course
  belongs_to :classroom

  validates :year, presence: true
  validates :intensive_name, presence: true
  validates :name, presence: true
  validates :grade, presence: true, numericality: { in: 1..9 }
end
