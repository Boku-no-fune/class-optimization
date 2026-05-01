class CreateTeachers < ActiveRecord::Migration[7.2]
  def change
    create_table :teachers do |t|
      t.string :employee_number, null: false
      t.string :name, null: false
      t.integer :gender, null: false, default: 0
      t.references :classroom, null: false, foreign_key: true
      t.string :job_type
      t.integer :subject_category, null: false, default: 0
      t.string :teachable_subjects, array: true, default: []
      t.string :teachable_course_types, array: true, default: []
      t.integer :years_of_service
      t.jsonb :available_weekdays, default: {}
      t.integer :academic_score, null: false, default: 50
      t.integer :management_score, null: false, default: 50
      t.integer :attrition_risk_score, null: false, default: 5
      t.timestamps
    end
    add_index :teachers, :employee_number, unique: true
  end
end
