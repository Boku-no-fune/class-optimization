Devise.setup do |config|
  config.jwt do |jwt|
    jwt.secret = ENV.fetch("JWT_SECRET_KEY", Rails.application.credentials.secret_key_base)
    jwt.dispatch_requests = [
      ["POST", %r{^/api/v1/auth/sign_in$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/api/v1/auth/sign_out$}]
    ]
    jwt.expiration_time = 24.hours.to_i
  end
end
