class CreateSurveyDeliveries < ActiveRecord::Migration[7.2]
  def change
    create_table :survey_deliveries do |t|
      t.references :survey, null: false, foreign_key: true
      t.references :teacher, null: false, foreign_key: true
      t.timestamps
    end
    add_index :survey_deliveries, [:survey_id, :teacher_id], unique: true
  end
end
