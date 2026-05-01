class CreateSurveys < ActiveRecord::Migration[7.2]
  def change
    create_table :surveys do |t|
      t.integer :survey_type, null: false, default: 0
      t.string :title, null: false
      t.text :description
      t.integer :target_weekdays, array: true, default: []
      t.jsonb :target_slots, default: []
      t.datetime :deadline
      t.references :created_by, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end
