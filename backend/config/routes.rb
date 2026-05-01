Rails.application.routes.draw do
  devise_for :users,
    path: "api/v1/auth",
    path_names: { sign_in: "sign_in", sign_out: "sign_out", registration: "register" },
    controllers: { sessions: "api/v1/auth/sessions", registrations: "api/v1/auth/registrations" }

  get "api/v1/health" => proc { [200, {}, [{ status: "ok" }.to_json]] }

  namespace :api do
    namespace :v1 do
      namespace :admin do
        resources :blocks
        resources :classrooms
        resources :courses
        resources :regular_classes
        resources :intensive_classes
        resources :teachers

        namespace :imports do
          post :teachers
          post :classrooms
          post :courses
          post :regular_classes
          post :intensive_classes
        end

        resources :schedules do
          member do
            post :expand
          end
          collection do
            post :optimize
          end
        end
        resources :schedule_entries, only: [:show, :update]

        resources :surveys do
          member do
            post :deliver
            get :results
          end
        end
      end

      namespace :teacher do
        get :schedules, to: "schedules#index"
        resources :surveys, only: [:index, :show] do
          member do
            post :respond
            patch :respond
          end
        end
      end
    end
  end
end
