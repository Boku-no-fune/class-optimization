class CreateScheduleEntries < ActiveRecord::Migration[7.2]
  def change
    create_table :schedule_entries do |t|
      t.references :schedule, null: false, foreign_key: true
      t.integer :class_id, null: false
      t.string :class_type, null: false
      t.date :date, null: false
      t.time :start_time
      t.time :end_time
      t.string :subject
      t.references :teacher, foreign_key: true
      t.boolean :is_modified, null: false, default: false
      t.text :note
      t.timestamps
    end
    add_index :schedule_entries, [:class_id, :class_type]
  end
end
