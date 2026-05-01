class CreateSurveyResponses < ActiveRecord::Migration[7.2]
  def change
    create_table :survey_responses do |t|
      t.references :survey_delivery, null: false, foreign_key: true
      t.jsonb :answers, default: {}
      t.datetime :submitted_at
      t.timestamps
    end
    add_index :survey_responses, :survey_delivery_id, unique: true, name: "idx_survey_responses_unique_delivery"
  end
end
