// Takes string input and prints that back

#include <stdio.h>

int main() {
    char input[100];

    fgets(input, sizeof(input), stdin);

    printf("Got: %s", input);

    return 0;
}