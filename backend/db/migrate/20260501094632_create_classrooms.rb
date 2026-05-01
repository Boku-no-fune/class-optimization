class CreateClassrooms < ActiveRecord::Migration[7.2]
  def change
    create_table :classrooms do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.references :block, null: false, foreign_key: true
      t.string :address
      t.string :nearest_station
      t.timestamps
    end
    add_index :classrooms, :code, unique: true
  end
end
