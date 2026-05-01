# Reset
puts "Seeding..."

# Admin account
admin = User.find_or_create_by!(email: "admin@example.com") do |u|
  u.password = "password123"
  u.role = :admin
end
puts "Admin: #{admin.email}"

# Block
block = Block.find_or_create_by!(name: "東京ブロック")
puts "Block: #{block.name}"

# Classroom
classroom = Classroom.find_or_create_by!(code: "TK01") do |c|
  c.name = "東京教室"
  c.block = block
  c.address = "東京都新宿区西新宿1-1-1"
  c.nearest_station = "新宿駅"
end
puts "Classroom: #{classroom.name}"

# Courses
regular_course = Course.find_or_create_by!(name: "小5高校受験コース") do |c|
  c.course_type = :regular
  c.target_grades = [5]
  c.subject_type = :mixed
  c.subjects = %w[英語 国語 算数 理科]
  c.sessions_per_week = 2
  c.periods_per_session = 2
  c.minutes_per_period = 90
end

intensive_course = Course.find_or_create_by!(name: "夏期講習小5コース") do |c|
  c.course_type = :intensive
  c.target_grades = [5]
  c.subject_type = :mixed
  c.subjects = %w[英語 国語 算数 理科]
  c.total_days = 10
  c.periods_per_day = 3
  c.minutes_per_period = 90
end
puts "Courses created"

# Teachers
teachers_data = [
  {
    employee_number: "T001",
    name: "山田太郎",
    gender: :male,
    job_type: "専任講師",
    subject_category: :science,
    teachable_subjects: %w[算数 数学 理科],
    teachable_course_types: %w[regular intensive],
    available_weekdays: {
      "monday" => { "from" => "14:00", "to" => "21:00" },
      "wednesday" => { "from" => "14:00", "to" => "21:00" },
      "friday" => { "from" => "14:00", "to" => "21:00" },
      "saturday" => { "from" => "09:00", "to" => "18:00" }
    },
    academic_score: 75,
    management_score: 65,
    attrition_risk_score: 10,
    email: "yamada@example.com"
  },
  {
    employee_number: "T002",
    name: "鈴木花子",
    gender: :female,
    job_type: "専任講師",
    subject_category: :liberal_arts,
    teachable_subjects: %w[英語 国語 社会],
    teachable_course_types: %w[regular intensive],
    available_weekdays: {
      "tuesday" => { "from" => "14:00", "to" => "21:00" },
      "thursday" => { "from" => "14:00", "to" => "21:00" },
      "saturday" => { "from" => "09:00", "to" => "18:00" }
    },
    academic_score: 80,
    management_score: 70,
    attrition_risk_score: 5,
    email: "suzuki@example.com"
  }
]

teachers_data.each do |td|
  email = td.delete(:email)
  teacher = Teacher.find_or_create_by!(employee_number: td[:employee_number]) do |t|
    t.assign_attributes(td.merge(classroom: classroom))
  end

  User.find_or_create_by!(email: email) do |u|
    u.password = "password123"
    u.role = :teacher
    u.teacher = teacher
  end
  puts "Teacher: #{teacher.name}"
end

# Regular class
rc = RegularClass.find_or_create_by!(name: "小5 Aクラス", year: 2026) do |c|
  c.grade = 5
  c.course = regular_course
  c.classroom = classroom
  c.weekdays = [1, 5]  # Monday, Friday
  c.subject_pattern = {
    "week1" => {
      "1" => [{ "subject" => "算数", "periods" => 1 }, { "subject" => "理科", "periods" => 1 }],
      "5" => [{ "subject" => "英語", "periods" => 1 }, { "subject" => "国語", "periods" => 1 }]
    },
    "week2" => {
      "1" => [{ "subject" => "英語", "periods" => 1 }, { "subject" => "国語", "periods" => 1 }],
      "5" => [{ "subject" => "算数", "periods" => 1 }, { "subject" => "理科", "periods" => 1 }]
    }
  }
  c.recommended_academic_score = 70
  c.recommended_management_score = 65
end
puts "RegularClass: #{rc.name}"

puts "Seed complete!"
