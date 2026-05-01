class CreateCourses < ActiveRecord::Migration[7.2]
  def change
    create_table :courses do |t|
      t.string :name, null: false
      t.integer :course_type, null: false, default: 0
      t.integer :subject_type, null: false, default: 0
      t.integer :target_grades, array: true, default: []
      t.string :subjects, array: true, default: []
      t.integer :sessions_per_week
      t.integer :periods_per_session
      t.integer :minutes_per_period
      t.integer :total_days
      t.integer :periods_per_day
      t.timestamps
    end
  end
end
