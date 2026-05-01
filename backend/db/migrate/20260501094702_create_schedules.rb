class CreateSchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :schedules do |t|
      t.references :classroom, null: false, foreign_key: true
      t.integer :year, null: false
      t.integer :schedule_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.jsonb :two_week_template, default: {}
      t.date :valid_from
      t.date :valid_to
      t.timestamps
    end
  end
end
