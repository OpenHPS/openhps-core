
USERS IDs
		ID sender (BLE Tags) | ID receiver (Smartphone) | ID in Ground Truth
USER 1:			1	 		 |			1				|		1
USER 2:			2	 		 |			2				|		2
USER 3:			3	 		 |			3				|		3

ANCHORS IDs
		ID sender  | ID receiver  
1062:		1062   |	1062
1063:		1063   |	1063
1064:		1064   |	1064
1069:		1069   |	1069
1070:		1070   |	1070
1071:		1071   |	1071
1079:		1079   |	1079
1080:		1080   |	1080


SELF-POSITIONING FOLDER
In this folder, we collect all beacon signals received by mobile phones for each transmission power (3dBm, -6dBm, -18dBm).
The data format is the following:
	<timestamp,ID receiver, ID sender, RSSI>
We report, for each scenario, the list of possible IDs:
	survey: 
		IDs receiver: {1}
		IDs sender:   {1,1062,1063,1064,1069,1070,1071,1079,1080}
		
	localization: 
		IDs receiver: {1}
		IDs sender:   {1,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 1: 
		IDs receiver: {1,2}
		IDs sender:   {1,2,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 2: 
		IDs receiver: {1,2}
		IDs sender:   {1,2,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 3: 
		IDs receiver: {1,2,3}
		IDs sender:   {1,2,3,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 4: 
		IDs receiver: {1,2,3}
		IDs sender:   {1,2,3,1062,1063,1064,1069,1070,1071,1079,1080}


REMOTE-POSITIONING FOLDER
In this folder, we collect all beacon signals received by anchors for each transmission power (3dBm, -6dBm, -18dBm).
The data format is the following:
	<timestamp,ID receiver, ID sender, RSSI>
We report, for each scenario, the list of possible IDs:
	survey: 
		IDs receiver: {1062,1063,1064,1069,1070,1071,1079,1080}
		IDs sender:   {1,1062,1063,1064,1069,1070,1071,1079,1080}
		
	localization: 
		IDs receiver: {1062,1063,1064,1069,1070,1071,1079,1080}
		IDs sender:   {1,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 1: 
		IDs receiver: {1062,1063,1064,1069,1070,1071,1079,1080}
		IDs sender:   {1,2,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 2: 
		IDs receiver: {1062,1063,1064,1069,1070,1071,1079,1080}
		IDs sender:   {1,2,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 3: 
		IDs receiver: {1062,1063,1064,1069,1070,1071,1079,1080}
		IDs sender:   {1,2,3,1062,1063,1064,1069,1070,1071,1079,1080}
		
	social scenario 4: 
		IDs receiver: {1062,1063,1064,1069,1070,1071,1079,1080}
		IDs sender:   {1,2,3,1062,1063,1064,1069,1070,1071,1079,1080}
		
		
GROUND TRUTH FOLDER
In this folder, we report timestamps and positions of the users during the data collection for each scenario.
The origin O(x,y) has been chosen for convienence at start of the corridor as shown in the attached maps. 
	survey:
		data format: <timestamp_start,timestamp_end,ID user,ID position,orientation>
		Possible values:
			IDs user: 	  {1}
			IDs position: {1,2,3,...,277}
			orientation:  {1,2,3,4}
			
	localization:
		data format: <timestamp,ID user,ID position>
		Possible values:
			IDs user: 	  {1}
			IDs position: {1,2,3,...,277}

	social scenario 1:
		data format: <timestamp,ID user,ID position>
		Possible values:
			IDs user: 	  {1}
			IDs position: {1,2,3,...,277}		
			
	social scenario 2:
		data format: <timestamp,ID user,ID position>
		Possible values:
			IDs user: 	  {1,2}
			IDs position: {1,2,3,...,277}		
			
	social scenario 3 and 4:
		data format: <timestamp,ID user,ID position>
		Possible values:
			IDs user: 	  {1,2,3}
			IDs position: {1,2,3,...,277}