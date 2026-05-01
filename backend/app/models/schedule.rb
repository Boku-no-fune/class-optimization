class Schedule < ApplicationRecord
  enum :schedule_type, { regular: 0, intensive: 1 }
  enum :status, { draft: 0, approved: 1, published: 2 }

  belongs_to :classroom
  has_many :schedule_entries, dependent: :destroy

  validates :year, presence: true
  validates :schedule_type, presence: true
end
