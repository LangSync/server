#! /bin/bash

read -p "Please provide a file name: " fileName
read -p "Please provide a number of fields: " fieldsNumber

if [ -z $fileName ]
then
    echo "Please provide a file name"
    exit 1
fi

if [ -z $fieldsNumber ]
then
    echo "Please provide a number of fields"
    exit 1
fi

if [ $fieldsNumber -lt 1 ]
then
    echo "Please provide a number of fields greater than 0"
    exit 1
fi


if [[ $fileName != *.json ]]
then
    echo "Please provide a file name with .json extension"
    exit 1
fi


function createSampleJsonFile() {
    touch $fileName
    
    echo "{" >> $fileName
    
    for (( i=1; i<=$fieldsNumber; i++ ))
    do
        if [[ $i != $fieldsNumber ]]
        then
            echo "\"key$i\": \"value$i\"," >> $fileName
        else
            echo "\"key$i\": \"value$i\"" >> $fileName
        fi
        
    done
    
    echo "}" >> $fileName
    
}

if [ ! -e $fileName ]
then
    createSampleJsonFile
    echo "File created successfully"
    exit 0
    
else
    
    mkdir tmp
    cd tmp
    createSampleJsonFile
    cd ..
    rm -f $fileName
    cp tmp/$fileName .
    
    sleep 2
    
    rm -rf tmp
    echo "File regenerated successfully"
fi

