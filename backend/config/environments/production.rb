require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true
  config.cache_store = :memory_store
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?
  config.log_level = :info
  config.log_tags = [:request_id]
  config.active_record.dump_schema_after_migration = false

  config.force_ssl = false  # Railway handles SSL termination

  config.action_mailer.default_url_options = { host: ENV.fetch("HOST", "localhost") }
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: ENV.fetch("SMTP_HOST", "smtp.sendgrid.net"),
    port: 587,
    user_name: ENV.fetch("SMTP_USERNAME", "apikey"),
    password: ENV.fetch("SMTP_PASSWORD", ""),
    authentication: "plain",
  }
end
