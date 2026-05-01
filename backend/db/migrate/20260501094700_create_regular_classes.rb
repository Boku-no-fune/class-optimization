class CreateRegularClasses < ActiveRecord::Migration[7.2]
  def change
    create_table :regular_classes do |t|
      t.integer :year, null: false
      t.string :name, null: false
      t.integer :grade, null: false
      t.references :course, null: false, foreign_key: true
      t.references :classroom, null: false, foreign_key: true
      t.integer :weekdays, array: true, default: []
      t.jsonb :subject_pattern, default: {}
      t.jsonb :teacher_assignments, default: {}
      t.integer :recommended_academic_score
      t.integer :recommended_management_score
      t.timestamps
    end
  end
end
