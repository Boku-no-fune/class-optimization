class CreateIntensiveClasses < ActiveRecord::Migration[7.2]
  def change
    create_table :intensive_classes do |t|
      t.integer :year, null: false
      t.string :intensive_name, null: false
      t.string :name, null: false
      t.integer :grade, null: false
      t.references :course, null: false, foreign_key: true
      t.references :classroom, null: false, foreign_key: true
      t.string :subjects, array: true, default: []
      t.jsonb :schedule_slots, default: []
      t.jsonb :teacher_assignments, default: {}
      t.integer :recommended_academic_score
      t.integer :recommended_management_score
      t.timestamps
    end
  end
end
