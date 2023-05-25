session=waitlist

docker-services:
	docker-compose up -d

run-backend: docker-services
	cargo --list | egrep '^\s+watch(\s+|$$)' > /dev/null || cargo install cargo-watch
	cd backend; cargo watch -x run

run-frontend: docker-services
	cd frontend; npm run start

tmux:
	tmux new-session -d -s $(session)
	tmux send-keys -t $(session):0 'make run-backend' C-m
	tmux split-window -t $(session):0 -h
	tmux send-keys -t $(session):0 'make run-frontend' C-m
	tmux attach -t $(session)

.PHONY: docker-services run-backend run-frontend tmux
