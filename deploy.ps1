& "C:\Program Files\Git\cmd\git.exe" config --global user.name "Evren"
& "C:\Program Files\Git\cmd\git.exe" config --global user.email "evren@akaytech.com"
& "C:\Program Files\Git\cmd\git.exe" add .
& "C:\Program Files\Git\cmd\git.exe" commit -m "Initial commit with Solvinger updates and CI/CD"
& "C:\Program Files\Git\cmd\git.exe" branch -M main
& "C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/akaytech/probsolve.git
& "C:\Program Files\Git\cmd\git.exe" push -u origin main --force
