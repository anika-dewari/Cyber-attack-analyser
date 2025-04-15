import socket
def scan_ports(target_ip, start_port, end_port):
    ip= socket.gethostbyname(target_ip)
    for port in range(start_port, end_port + 1):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.5)
        result = sock.connect_ex((ip, port))
        if result == 0:
            print(f"Port {port} is OPEN")
        sock.close()

target_ip = input("Enter the URL or IP address: ")
scan_ports(target_ip, 1, 1024)
