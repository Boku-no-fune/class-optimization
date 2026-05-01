class AdminMailer < ApplicationMailer
  def survey_response_changed(admin, response)
    @admin = admin
    @response = response
    @teacher = response.survey_delivery.teacher
    mail(to: admin.email, subject: "【回答変更】#{@teacher.name}がアンケート回答を更新しました")
  end
end
