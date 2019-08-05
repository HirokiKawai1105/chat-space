#サーバ上でのアプリケーションコードが設置されているディレクトリを変数に入れておく
$worker  = 2
$timeout = 30
$app_dir = "/var/www/rails/chat-space"
$listen  = File.expand_path 'tmp/sockets/.unicorn.sock', $app_dir
$pid     = File.expand_path 'tmp/pids/unicorn.pid', $app_dir
$std_log = File.expand_path 'log/unicorn.log', $app_dir

app_path = File.expand_path('/var/www/', chat-space)

#アプリケーションサーバの性能を決定する
worker_processes $worker

#アプリケーションの設置されているディレクトリを指定
working_directory $app_dir

#Unicornの起動に必要なファイルの設置場所を指定
pid $pid

#ポート番号を指定
listen $listen

#エラーのログを記録するファイルを指定
stderr_path $std_log

#通常のログを記録するファイルを指定
stdout_path $std_log

#Railsアプリケーションの応答を待つ上限時間を設定
timeout $timeout

#以下は応用的な設定なので説明は割愛

preload_app true
GC.respond_to?(:copy_on_write_friendly=) && GC.copy_on_write_friendly = true

check_client_connection false

run_once = true

before_fork do |server, worker|
  defined?(ActiveRecord::Base) &&
    ActiveRecord::Base.connection.disconnect!

  if run_once
    run_once = false # prevent from firing again
  end

  old_pid = "#{server.config[:pid]}.oldbin"
  if File.exist?(old_pid) && server.pid != old_pid
    begin
      sig = (worker.nr + 1) >= server.worker_processes ? :QUIT : :TTOU
      Process.kill(sig, File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH => e
      logger.error e
    end
  end
end

after_fork do |_server, _worker|
  defined?(ActiveRecord::Base) && ActiveRecord::Base.establish_connection
end