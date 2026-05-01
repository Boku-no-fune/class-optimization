# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_01_094707) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "blocks", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "classrooms", force: :cascade do |t|
    t.string "code", null: false
    t.string "name", null: false
    t.bigint "block_id", null: false
    t.string "address"
    t.string "nearest_station"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["block_id"], name: "index_classrooms_on_block_id"
    t.index ["code"], name: "index_classrooms_on_code", unique: true
  end

  create_table "courses", force: :cascade do |t|
    t.string "name", null: false
    t.integer "course_type", default: 0, null: false
    t.integer "subject_type", default: 0, null: false
    t.integer "target_grades", default: [], array: true
    t.string "subjects", default: [], array: true
    t.integer "sessions_per_week"
    t.integer "periods_per_session"
    t.integer "minutes_per_period"
    t.integer "total_days"
    t.integer "periods_per_day"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "intensive_classes", force: :cascade do |t|
    t.integer "year", null: false
    t.string "intensive_name", null: false
    t.string "name", null: false
    t.integer "grade", null: false
    t.bigint "course_id", null: false
    t.bigint "classroom_id", null: false
    t.string "subjects", default: [], array: true
    t.jsonb "schedule_slots", default: []
    t.jsonb "teacher_assignments", default: {}
    t.integer "recommended_academic_score"
    t.integer "recommended_management_score"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classroom_id"], name: "index_intensive_classes_on_classroom_id"
    t.index ["course_id"], name: "index_intensive_classes_on_course_id"
  end

  create_table "jwt_denylist", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.index ["jti"], name: "index_jwt_denylist_on_jti"
  end

  create_table "regular_classes", force: :cascade do |t|
    t.integer "year", null: false
    t.string "name", null: false
    t.integer "grade", null: false
    t.bigint "course_id", null: false
    t.bigint "classroom_id", null: false
    t.integer "weekdays", default: [], array: true
    t.jsonb "subject_pattern", default: {}
    t.jsonb "teacher_assignments", default: {}
    t.integer "recommended_academic_score"
    t.integer "recommended_management_score"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classroom_id"], name: "index_regular_classes_on_classroom_id"
    t.index ["course_id"], name: "index_regular_classes_on_course_id"
  end

  create_table "schedule_entries", force: :cascade do |t|
    t.bigint "schedule_id", null: false
    t.integer "class_id", null: false
    t.string "class_type", null: false
    t.date "date", null: false
    t.time "start_time"
    t.time "end_time"
    t.string "subject"
    t.bigint "teacher_id"
    t.boolean "is_modified", default: false, null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["class_id", "class_type"], name: "index_schedule_entries_on_class_id_and_class_type"
    t.index ["schedule_id"], name: "index_schedule_entries_on_schedule_id"
    t.index ["teacher_id"], name: "index_schedule_entries_on_teacher_id"
  end

  create_table "schedules", force: :cascade do |t|
    t.bigint "classroom_id", null: false
    t.integer "year", null: false
    t.integer "schedule_type", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.jsonb "two_week_template", default: {}
    t.date "valid_from"
    t.date "valid_to"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classroom_id"], name: "index_schedules_on_classroom_id"
  end

  create_table "survey_deliveries", force: :cascade do |t|
    t.bigint "survey_id", null: false
    t.bigint "teacher_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["survey_id", "teacher_id"], name: "index_survey_deliveries_on_survey_id_and_teacher_id", unique: true
    t.index ["survey_id"], name: "index_survey_deliveries_on_survey_id"
    t.index ["teacher_id"], name: "index_survey_deliveries_on_teacher_id"
  end

  create_table "survey_responses", force: :cascade do |t|
    t.bigint "survey_delivery_id", null: false
    t.jsonb "answers", default: {}
    t.datetime "submitted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["survey_delivery_id"], name: "idx_survey_responses_unique_delivery", unique: true
    t.index ["survey_delivery_id"], name: "index_survey_responses_on_survey_delivery_id"
  end

  create_table "surveys", force: :cascade do |t|
    t.integer "survey_type", default: 0, null: false
    t.string "title", null: false
    t.text "description"
    t.integer "target_weekdays", default: [], array: true
    t.jsonb "target_slots", default: []
    t.datetime "deadline"
    t.bigint "created_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_surveys_on_created_by_id"
  end

  create_table "teachers", force: :cascade do |t|
    t.string "employee_number", null: false
    t.string "name", null: false
    t.integer "gender", default: 0, null: false
    t.bigint "classroom_id", null: false
    t.string "job_type"
    t.integer "subject_category", default: 0, null: false
    t.string "teachable_subjects", default: [], array: true
    t.string "teachable_course_types", default: [], array: true
    t.integer "years_of_service"
    t.jsonb "available_weekdays", default: {}
    t.integer "academic_score", default: 50, null: false
    t.integer "management_score", default: 50, null: false
    t.integer "attrition_risk_score", default: 5, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classroom_id"], name: "index_teachers_on_classroom_id"
    t.index ["employee_number"], name: "index_teachers_on_employee_number", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "role", default: 0, null: false
    t.bigint "teacher_id"
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "classrooms", "blocks"
  add_foreign_key "intensive_classes", "classrooms"
  add_foreign_key "intensive_classes", "courses"
  add_foreign_key "regular_classes", "classrooms"
  add_foreign_key "regular_classes", "courses"
  add_foreign_key "schedule_entries", "schedules"
  add_foreign_key "schedule_entries", "teachers"
  add_foreign_key "schedules", "classrooms"
  add_foreign_key "survey_deliveries", "surveys"
  add_foreign_key "survey_deliveries", "teachers"
  add_foreign_key "survey_responses", "survey_deliveries"
  add_foreign_key "surveys", "users", column: "created_by_id"
  add_foreign_key "teachers", "classrooms"
end
