#include <stdio.h>
#include <unistd.h>


int main(void) {

    while(1) {
        printf("Loop count: %d\n", count);
    
        // Sleep for 1 second
        sleep(10); 
    }

    return 0;
}