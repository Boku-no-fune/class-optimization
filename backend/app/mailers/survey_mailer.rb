class SurveyMailer < ApplicationMailer
  def delivery_notification(teacher, survey)
    @teacher = teacher
    @survey = survey
    mail(to: teacher.user&.email, subject: "【アンケート】#{survey.title}")
  end
end
