package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
)

func main() {
	encKey := "NFd6N3v1nbL47FK0xpZjxZ7NY4fYpNYd"
	// Initialization vector
	iv := "TestingIV1234567"
	ciphertext, err := base64.StdEncoding.DecodeString("Sd74jq0Fe0CuJHUXdou3udBg38jXICKOjw7L+Sm7sYw=")

	if err != nil {
		panic(err)
	}

	block, err := aes.NewCipher([]byte(encKey))
	if err != nil {
		panic(err)
	}

	if len(ciphertext)%aes.BlockSize != 0 {
		panic("ciphertext is not a multiple of the block size")
	}

	mode := cipher.NewCBCDecrypter(block, []byte(iv))
	mode.CryptBlocks(ciphertext, ciphertext)

	fmt.Println(ciphertext)
	fmt.Printf("%s\n", ciphertext)

	var result [16]byte;
	for i :=0; i<=len(ciphertext); i++{
		result[i] = ciphertext[i];
		if i==15{
			break;
		}
	}
	fmt.Println(result)
	fmt.Printf("%s\n", result)
}