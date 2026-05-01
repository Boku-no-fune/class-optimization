class Course < ApplicationRecord
  SUBJECTS = {
    liberal_arts: %w[英語 国語 社会 適性文系],
    science: %w[算数 数学 理科 適性理系]
  }.freeze

  GRADES = {
    1 => "小1", 2 => "小2", 3 => "小3",
    4 => "小4", 5 => "小5", 6 => "小6",
    7 => "中1", 8 => "中2", 9 => "中3"
  }.freeze

  ALL_SUBJECTS = (SUBJECTS[:liberal_arts] + SUBJECTS[:science]).freeze

  enum :course_type, { regular: 0, intensive: 1 }
  enum :subject_type, { liberal_arts: 0, science: 1, mixed: 2 }

  has_many :regular_classes, dependent: :destroy
  has_many :intensive_classes, dependent: :destroy

  validates :name, presence: true
  validates :course_type, presence: true
  validates :subject_type, presence: true
end
