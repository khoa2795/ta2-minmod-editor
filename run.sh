
CONTAINER_NAME_FILTER="isiproject"

running_containers=$(docker ps -q --filter "name=$CONTAINER_NAME_FILTER")

if [ -n "$running_containers" ]; then
  echo "Stopping and removing running '$CONTAINER_NAME_FILTER' containers..."
  
  docker stop $running_containers
  docker rm $running_containers
else
  echo "No '$CONTAINER_NAME_FILTER' containers are running."
fi

echo "Running 'docker-compose up --build -d'..."
docker-compose up --build -d

echo "Currently running containers:"
docker ps

echo "Tailing logs. Press Ctrl+C to stop."
docker-compose logs -f
